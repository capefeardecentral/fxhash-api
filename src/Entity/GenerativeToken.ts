import { GraphQLJSONObject } from 'graphql-type-json'
import slugify from 'slugify'
import { Field, ObjectType } from 'type-graphql'
import { Entity, Column, PrimaryColumn, UpdateDateColumn, BaseEntity, CreateDateColumn, ManyToOne, OneToMany, RelationId } from 'typeorm'
import { GenerativeTokenMetadata } from '../types/Metadata'
import { Action } from './Action'
import { Objkt } from './Objkt'
import { User } from './User'

@Entity()
@ObjectType()
export class GenerativeToken extends BaseEntity {
  @Field()
  @PrimaryColumn()
  id: number

  @Field({ nullable: true })
  @Column({ nullable: true })
  slug?: string

  @ManyToOne(() => User, user => user.generativeTokens)
  author?: User

	@RelationId((token: GenerativeToken) => token.author)
	authorId: number

  @Field()
  @Column({ nullable: true })
  name: string

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column({ type: "json", nullable: true })
  metadata: GenerativeTokenMetadata

  @Field({ nullable: true })
  @Column({ nullable: true })
  metadataUri?: string

  @Field(() => [String],{ nullable: true })
  @Column("text", { nullable: true, array: true })
  tags: string[]

  @Field()
  @Column({ default: 0 })
  price: number = 0

  @Field()
  @Column({ default: 0 })
  supply: number = 0

  @Field()
  @Column({ default: 0 })
  balance: number = 0

  @Field()
  @Column({ default: false })
  enabled: boolean = false

  @Field()
  @Column({ default: 0 })
  royalties: number = 0

  @OneToMany(() => Objkt, objkt => objkt.issuer)
  objkts: Objkt[]

  @OneToMany(() => Action, action => action.token)
  actions: Action[]

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', nullable: true })
  updatedAt: Date

  static async findOrCreate(id: number, createdAt: string): Promise<GenerativeToken> {
    let token = await GenerativeToken.findOne(id)
    if (!token) {
      token = GenerativeToken.create({ id, createdAt })
    }
    return token
  }

  /**
   * Given a name, sets the slug on the entity (ensures that no other entity has the same slug)
   */
   async setSlugFromName(name: string) {
    let appendix: number|null = null
    while(true) {
      let slug = slugify(`${name} ${appendix!==null?appendix:""}`, {
        lower: true
      })

      // do we have an Entity with this slug already ?
      const found = await GenerativeToken.findOne({
        where: {
          slug
        }
      })
      if (found) {
        appendix = appendix === null ? 1 : appendix+1
        continue
      }
      else {
        this.slug = slug
        break
      }
    }
  }
}