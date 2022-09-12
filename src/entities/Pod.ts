import { GoalType } from "../types/dbTypes";

import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Pod extends BaseEntity {
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
}
