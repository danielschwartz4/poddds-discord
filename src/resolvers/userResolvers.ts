import { User } from "../entities/User"

export const readAllUsers = async () => {
    return await User.find()
}