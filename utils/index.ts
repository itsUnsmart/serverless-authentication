export const parse = (body?: string) => {
    try {
        const parsed = JSON.parse(body ?? '{}')
        return parsed
    } catch (error) {
        return {}
    }
}

export const cleanObject = <T>(object: T): Partial<T> => {
    if (typeof object !== 'object') return object

    Object.keys(object as { [key: string]: any }).forEach((key: string) => {
        const value = (object as { [key: string]: any })[key]
        if (typeof value === 'object' && value.constructor === Object) {
            const cleaned = cleanObject(value)

            if (Object.keys(cleaned).length === 0) {
                delete (object as { [key: string]: any })[key]
            } else {
                (object as { [key: string]: any })[key] = cleaned
            }
        } else if ([null, undefined, ''].includes(value)) {
            delete (object as { [key: string]: any })[key]
        }
    })

    return object
}
