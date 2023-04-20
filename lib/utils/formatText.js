export const textCleaner = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
