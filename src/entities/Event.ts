import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Event extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  discordId!: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  goalId: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  adjustedDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true, default: false })
  completed: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true, default: false })
  skipped: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  goalLeftChannelId: string;
}
