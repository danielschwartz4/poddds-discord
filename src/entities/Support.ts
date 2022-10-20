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
export class Support extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  userId: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  discordId: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: 0 })
  points: number;

  @Field({ nullable: true })
  @Column({ nullable: true, default: false })
  supportedToday: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
