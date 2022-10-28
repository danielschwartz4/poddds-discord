import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class LeaderboardPair extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userIdA: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userIdB: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  leaderboardId: number;

  @Field()
  @Column({ default: 0 })
  numComplete: number;

  @Field()
  @Column({ default: 0 })
  numPossible: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
