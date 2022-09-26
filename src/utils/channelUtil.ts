export const readTypeFromChannelName = (name: string) => {
    name = name.toLowerCase()
    let type;
    if (name.includes('exercise pod') || name.includes('fitness pod')) {
        type = 'exercise'
    } else if (name.includes('study pod')) {
        type = 'study'
    }
    return type
}