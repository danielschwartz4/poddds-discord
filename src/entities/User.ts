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
  @Column({ nullable: true })
  startedGoalAt!: Date;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column({ default: 0 })
  skips: number;

  @Field()
  @Column({ default: 0 })
  misses: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  goalLeftChannelId: string;
}
