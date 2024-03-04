import { slug } from 'github-slugger'

const removeTilde = (texto) => {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

const kebabCase = (str) => slug(removeTilde(str))

export default kebabCase
