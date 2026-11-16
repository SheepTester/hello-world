import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['claude-formatted/cli.js'],
  outdir: 'claude-formatted-for-real',
  bundle: true,
  platform: 'node',
  format: 'esm'
})
