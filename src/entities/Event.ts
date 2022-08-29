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

  @Field()
  @Column()
  date: string; // moment().format('l'); 8/23/2022

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
