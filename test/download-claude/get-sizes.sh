echo "claude-code-darwin-arm64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-darwin-arm64@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-darwin-x64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-darwin-x64@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-linux-x64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-linux-x64@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-linux-arm64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-linux-arm64@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-linux-x64-musl"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-linux-x64-musl@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-linux-arm64-musl"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-linux-arm64-musl@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-win32-x64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-win32-x64@2.1.325?meta' | jq '.files[0].size'
echo "claude-code-win32-arm64"
curl -s 'https://unpkg.com/@anthropic-ai/claude-code-win32-arm64@2.1.325?meta' | jq '.files[0].size'
