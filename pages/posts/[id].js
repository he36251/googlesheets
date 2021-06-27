import {google} from 'googleapis';

export async function getStaticProps({params}) {

    const auth = await google.auth.getClient({scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});

    const sheets = google.sheets({version: process.env.SHEET_VERSION, auth});

    const id = params.id;
    const range = `${process.env.SHEET_TABLE}!A${id}:B${id}`;

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range
    });

    const [title, content] = response.data.values[0]
    return {
        props: {
            title,
            content
        },

        revalidate: process.env.REVALIDATE
    };
}

export async function getStaticPaths() {
    // Call an external API endpoint to get posts
    const auth = await google.auth.getClient({scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']});
    const sheets = google.sheets({version: process.env.SHEET_VERSION, auth});

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SHEET_ID,
        range: `${process.env.SHEET_TABLE}!A2:A100`,
    });

    const posts = response.data.values.flat();

    // Get the paths we want to pre-render based on posts
    const paths = posts.map((post, i) => ({
        params: { id: `${i + 1}` },
    }))

    // We'll pre-render only these paths at build time.
    // { fallback: false } means other routes should 404.
    return { paths, fallback: false }
}

export default function Post({title, content}) {
    return <article>
        <h1>{title}</h1>
        <div dangerouslySetInnerHTML={{__html: content}}/>
    </article>
}