import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { MessageSent } from "../generated/schema"
import { MessageSent as MessageSentEvent } from "../generated/CCFVNode/CCFVNode"
import { handleMessageSent } from "../src/ccfv-node"
import { createMessageSentEvent } from "./ccfv-node-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let messageId = Bytes.fromI32(1234567890)
    let destinationChainSelector = BigInt.fromI32(234)
    let receiver = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let token = Address.fromString("0x0000000000000000000000000000000000000001")
    let tokenAmount = BigInt.fromI32(234)
    let feeToken = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let fees = BigInt.fromI32(234)
    let voteAmount = BigInt.fromI32(234)
    let newMessageSentEvent = createMessageSentEvent(
      messageId,
      destinationChainSelector,
      receiver,
      token,
      tokenAmount,
      feeToken,
      fees,
      voteAmount
    )
    handleMessageSent(newMessageSentEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("MessageSent created and stored", () => {
    assert.entityCount("MessageSent", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "messageId",
      "1234567890"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "destinationChainSelector",
      "234"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "receiver",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "token",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "tokenAmount",
      "234"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "feeToken",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "fees",
      "234"
    )
    assert.fieldEquals(
      "MessageSent",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "voteAmount",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
