import { slug } from 'github-slugger'

export const kebabCase = (str) => slug(str)

export default kebabCase
