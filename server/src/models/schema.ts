const typeDefs = `
  type Token {
    value: String
    position: [Int]
  }

  type Page {
    pageIndex: Int
    tokens: [Token]
    content: String
  }

  type Book {
    pages: [Page]
    title: String
    author: String
  }

  type Query {
    book(title: String): Book
  }
`;

export default typeDefs;
