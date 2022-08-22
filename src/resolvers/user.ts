import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { UserResponse, UsersResponse } from "../types/responseTypes";

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async createUser(
    @Arg("discordId") discordId: string,
    @Arg("discordUsername") discordUsername: string
  ) {
    let user;
    try {
      user = await User.create({
        discordUsername,
        discordId,
      }).save();
    } catch (err) {
      console.log("Error:", err.message);
    }

    return { user };
  }

  @Query(() => UserResponse, { nullable: true })
  async readUser(@Arg("discordId") discordId: string) {
    const user = await User.findOne({ where: { discordId } });
    if (!user) {
      return { error: "user does not exist" };
    }
    return { user };
  }

  @Query(() => UsersResponse, { nullable: true })
  async readUsers() {
    const users = await User.find();
    if (!users) {
      return { error: "user does not exist" };
    }
    return { users };
  }

  @Mutation(() => UserResponse)
  async updateUser(@Arg("user") user: User) {
    const id = user.id;
    User.update({ id }, { startedGoalAt: user.startedGoalAt });
    User.update({ id }, { discordUsername: user.discordUsername });
    User.update({ id }, { discordId: user.discordId });
    return { user };
  }
}
