import Config from './config'
import Product from './models/product'

const list: { [key: string]: ReturnType<typeof Product> } = {}

Config.products.list.forEach(name => {
    list[name] = Product(`${name}.${Config.products.extension}`)
})

export default list
