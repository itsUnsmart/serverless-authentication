import Config from '../config'

const isProductUrl = (url?: string) => {
    if (!url) return false

    const parts = url.split('.')

    const validLength = (i: number) => parts[i].length >= 3 && parts[i].length <= 30

    return parts.length === 3 && validLength(0) && url.endsWith(Config.products.extension)
}

const getProductFromUrl = (url?: string) => {
    if (!url || !isProductUrl(url)) return { name: null, isValid: false }

    const parts = url.split('.')

    return {
        name: parts[0],
        isValid: Config.products.list.includes(parts[0])
    }
}

export default (url?: string) => {
    return {
        url,
        ...getProductFromUrl(url)
    }
}
