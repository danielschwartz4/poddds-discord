import { GraphQLJSONObject } from "graphql-type-json";
import { DaysType } from "../types/dbTypes";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class WeeklyGoal extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

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
  podId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  goalLeftChannelId: string;

  @Field()
  @Column({ default: 0 })
  misses: number;

  @Field(() => GraphQLJSONObject)
  @Column("jsonb")
  days!: DaysType;

  @Field({ nullable: true })
  @Column({ nullable: true })
  timeZone: string;

  @Field({ nullable: true })
  @Column({ type: "timestamp with time zone", nullable: true })
  adjustedStartDate: Date;

  @Field({ nullable: true })
  @Column({ type: "timestamp with time zone", nullable: true })
  adjustedEndDate: Date;
}
