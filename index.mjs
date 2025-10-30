import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("HANDLER EVENT!!: ", JSON.stringify(event));
  const { rawPath, body } = event;
  const httpMethod = event.requestContext.http.method;

  if (httpMethod == "GET" && rawPath == "/notes") {
    const result = await docClient.send(
      new ScanCommand({
        TableName: "Notes",
      })
    );

    console.log("RESULT FROM GET:", result);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  }
  // get by ID
  // matches /note/{id}
  if (httpMethod == "GET" && rawPath == rawPath.match(/^\/notes\/\w+/)) {
    const id = rawPath.split("/")[2];

    const result = await docClient.send(
      new GetCommand({
        TableName: "Notes",
        Key: {
          id,
        },
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  }

  // post a note
  if (httpMethod == "POST" && rawPath == "/notes") {
    const result = await docClient.send(
      new PutCommand({
        TableName: "Notes",
        Item: JSON.parse(body),
      })
    );

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    };
  }

  // delete a note by id
  // matches /note/{id}
  if (httpMethod === "DELETE" && rawPath.match(/^\/notes\/\w+/)) {
    const id = rawPath.split("/")[2];
    await docClient.send(
      new DeleteCommand({ TableName: "Notes", Key: { id } })
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Note deleted" }),
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "We can not find the route you're looking for",
      httpMethod,
      rawPath,
    }),
  };
};
