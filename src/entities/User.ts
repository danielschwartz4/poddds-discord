import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { WeeklyGoal } from "./WeeklyGoal";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  discordId!: string;

  @Field()
  @Column()
  discordUsername!: string;

  @Field({ nullable: true })
  @Column({ type: 'integer', nullable: true }) // adding type = integer allows the value to be null and adding | null
  fitnessPodId!: number;

  @Field({ nullable: true })
  @Column({ type: 'integer', nullable: true })
  studyPodId!: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [WeeklyGoal], { nullable: true })
  @OneToMany(() => WeeklyGoal, (weeklyGoal) => weeklyGoal.user, {
    nullable: true,
  })
  weeklyGoal: WeeklyGoal[];
}
