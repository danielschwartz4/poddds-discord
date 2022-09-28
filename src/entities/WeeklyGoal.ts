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

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId: number;

  @Field()
  @Column()
  discordId!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  evidence: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  goalLeftChannelId: string;

  @Field()
  @Column({ default: 0 })
  misses: number;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column("jsonb", { nullable: true })
  days: DaysType;

  @Field()
  @Column({
    type: "enum",
    enum: ["fitness", "study"],
    default: "fitness",
    nullable: true,
  })
  type: GoalType;

  @Field({ nullable: true })
  @Column({ nullable: true, default: "-5" })
  timeZone: string;

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
