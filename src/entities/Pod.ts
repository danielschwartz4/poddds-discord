import { GraphQLJSONObject } from "graphql-type-json";
import { DaysType, GoalType } from "../types/dbTypes";
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class WeeklyGoal extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ default: 0 })
  numMembers: number;

  @Field()
  @Column({
    type: "enum",
    enum: ["exercise", "study"],
    default: "exercise",
  })
  type: GoalType;

  @Field({ nullable: true })
  @Column({ type: "timestamp with time zone", nullable: true })
  adjustedStartDate: Date;

  @Field({ nullable: true })
  @Column({ type: "timestamp with time zone", nullable: true })
  adjustedEndDate: Date;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.weeklyGoal)
  user: User;
}
