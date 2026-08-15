import { NextRequest, NextResponse } from "next/server";
import { searchKnowledgeExecute } from "./tools";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { message } = body;

    if (!message) {
      return NextResponse.json(
        {
          reply: "Message is required.",
          sources: [],
          tool: "error",
        },
        { status: 400 }
      );
    }


    // Execute knowledge search tool
    const result = await searchKnowledgeExecute(message);


    return NextResponse.json({
      ...result,
      tool: "output",
    });


  } catch (error) {

    console.error("Chat Route Error:", error);


    return NextResponse.json(
      {
        reply:
          "Something went wrong while processing your request.",
        sources: [],
        tool: "error",
      },
      { status: 500 }
    );
  }
}
