#!/bin/bash
# ==============================================================
# 六爻小程序 — 版本迭代自动保存脚本
# 用法: bash scripts/save-version.sh <版本标签>
# 示例: bash scripts/save-version.sh v0.1_FrameworkInit
# 示例: bash scripts/save-version.sh v0.2_PaipanEngine
#
# 该脚本会:
#   1. 将当前工作目录完整快照到 D:\sixyao-versions\
#   2. 自动提交 git 并推送
#   3. 打上版本 tag
# ==============================================================

set -e

# ── 参数校验 ──
if [ $# -lt 1 ]; then
  echo "❌ 用法: bash scripts/save-version.sh <版本标签>"
  echo "   示例: bash scripts/save-version.sh v0.2_PaipanEngine"
  echo ""
  echo "   当前版本列表:"
  ls -1 /mnt/d/sixyao-versions/ 2>/dev/null || echo "   （暂无版本记录）"
  exit 1
fi

VERSION_TAG="$1"
PROJECT_DIR="/mnt/d/sixyao"
SNAPSHOT_DIR="/mnt/d/sixyao-versions/sixyao_${VERSION_TAG}"
GIT_COMMIT_MSG="release: ${VERSION_TAG}"

# ── 检查工作目录是否干净 ──
cd "$PROJECT_DIR"
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  工作目录有未提交的更改，先 commit..."
  git add -A
  git commit -m "chore: ${VERSION_TAG} 迭代前中间提交"
fi

# ── 1. 创建文件系统快照 ──
echo "📦 创建快照: ${SNAPSHOT_DIR}"
rm -rf "$SNAPSHOT_DIR"
mkdir -p "$SNAPSHOT_DIR"

# 排除 .git 目录
rsync -a --exclude='.git' "$PROJECT_DIR/" "$SNAPSHOT_DIR/"
echo "✅ 快照已保存: ${SNAPSHOT_DIR}"

# ── 2. 提交并推送 git ──
echo "📡 提交 git..."
git add -A
git commit -m "$GIT_COMMIT_MSG" --allow-empty

# 打版本 tag
if git tag -l | grep -q "^${VERSION_TAG}$"; then
  echo "⚠️  Tag ${VERSION_TAG} 已存在，跳过 tag"
else
  git tag -a "$VERSION_TAG" -m "$GIT_COMMIT_MSG"
  echo "🏷️  已创建 tag: ${VERSION_TAG}"
fi

echo "🚀 推送到 GitHub..."
git push origin main --tags

echo ""
echo "═══════════════════════════════════════"
echo "  ✅ ${VERSION_TAG} 保存完成"
echo "  快照: ${SNAPSHOT_DIR}"
echo "  Git:  https://github.com/likefan1996-star/sixyao-app"
echo "═══════════════════════════════════════"
