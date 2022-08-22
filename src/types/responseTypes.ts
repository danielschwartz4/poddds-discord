import { User } from "../entities/User";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class UserResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class UsersResponse {
  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => User, { nullable: true })
  users?: User[];
}
