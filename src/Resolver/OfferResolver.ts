import { Arg, Args, Ctx, FieldResolver, Query, Resolver, Root } from "type-graphql"
import { Offer } from "../Entity/Offer"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { RequestContext } from "../types/RequestContext"
import { PaginationArgs, useDefaultValues } from "./Arguments/Pagination"
import { In } from "typeorm"
import { OffersSortArgs } from "./Arguments/Sort"

@Resolver(Offer)
export class OfferResolver {
  @FieldResolver(returns => User, { nullable: true })
	issuer(
		@Root() offer: Offer,
		@Ctx() ctx: RequestContext
	) {
    if (offer.issuerId == null) return null
		if (offer.issuer) return offer.issuer
		return ctx.usersLoader.load(offer.issuerId)
	}

  @FieldResolver(returns => Objkt, { nullable: true })
	objkt(
		@Root() offer: Offer,
		@Ctx() ctx: RequestContext
	) {
    if (offer.objktId == null) return null
		if (offer.objkt) return offer.objkt
		return ctx.objktsLoader.load(offer.objktId)
	}
  
  @Query(returns => [Offer])
	async offers(
		@Args() { skip, take }: PaginationArgs,
		@Args() sortArgs: OffersSortArgs
	): Promise<Offer[]> {
		if (Object.keys(sortArgs).length === 0) {
			sortArgs.createdAt = "DESC"
		}
		[skip, take] = useDefaultValues([skip, take], [0, 20])
		return Offer.find({
			order: sortArgs,
			skip,
			take,
			cache: 10000
		})
	}
	
  @Query(returns => [Offer], { nullable: true })
	async offersByIds(
		@Arg("ids", type => [Number]) ids: number[],
		@Args() sortArgs: OffersSortArgs
	): Promise<Offer[]> {
		const offers = await Offer.find({
			where: {
				id: In(ids)
			},
			order: sortArgs,
			take: 100
		})

		return offers
	}
}