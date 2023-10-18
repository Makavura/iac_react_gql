export const BOOK_QUERY = `
    query($title: String!) {
        book(title: $title) {
        title
        author
        pages {
            pageIndex
            content
            tokens {
                value
                position
            }
        }
        } 
    }
`;

