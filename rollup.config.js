const { terser } = require('rollup-plugin-terser');
const copy = require('rollup-plugin-copy');

export default {
  input: 'src/index.js',
  external: ['lodash', 'lodash/fp'],
  output: [
    {
      file: 'dist/lens.min.js',
      format: 'cjs',
    },
    {
      file: 'dist/lens.js',
      format: 'cjs',
    },
    {
      file: 'dist/lens.esm.js',
      format: 'esm',
    }
  ],
  plugins: [
    terser({
      include: [/^.+\.min\.js$/],
    }),
    copy({
      targets: [
        { src: 'src/lens.d.ts', dest: 'dist' },
      ],
    })
  ]
}
