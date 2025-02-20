import { render } from "astro:content";

const domain = import.meta.env.WP_DOMAIN

const apiUrl = `${domain}/wp-json/wp/v2`;

export const getPageInfo = async (slug: string) => {
    const res = await fetch(`${apiUrl}/pages?slug=${slug}`)

    if (!res.ok) throw new Error('Failed to fetch page info')

    const [data] = await res.json()

    const { title: { rendered: title }, content: { rendered: content } } = data
    return { title, content };
}

export const getLatestPosts = async ({ perPage = 10 }: { perPage?: number }) => {
    const res = await fetch(`${apiUrl}/posts?per_page=${perPage}&_embed`)
    if (!res.ok) throw new Error('Failed to fetch latest posts')

    const results = await res.json()
    if (!results.length) throw new Error('No posts found')

    const posts = results.map((post: any) => {
        const {
            title: { rendered: title },
            excerpt: { rendered: excerpt },
            content: { rendered: content },
            date,
            slug
        } = post

        const featuredImage = post._embedded['wp:featuredmedia'][0].source_url;

        return { title, excerpt, content, date, slug, featuredImage }
    })

    return posts
}

export const getPostInfo = async (slug: string) => {
    const res = await fetch(`${apiUrl}/posts?slug=${slug}&_embed`)
    if (!res.ok) throw new Error('Failed to fetch post info')

    const [data] = await res.json()
    const {
        title: { rendered: title },
        content: { rendered: content },
    } = data;

    const featuredImage = data._embedded['wp:featuredmedia'][0].source_url;

    return { title, content, featuredImage }
}

// obtener todos los slugs de los posts
// tiene sentido hacerlo si la web no se actualiza mucho y no tiene muchos posts
// si la web tiene muchos posts, o un periodico... es mejor añadir modo servidor 'output: server' en astro.config.js 

export const getAllPostSlugs = async () => {
    const res = await fetch(`${apiUrl}/posts?per_page=100`)
    if (!res.ok) throw new Error('Failed to fetch post slugs')

    const results = await res.json()
    if (!results.length) throw new Error('No posts found')

    const slugs = results.map((post: any) => post.slug)
    return slugs;
}

export const getAllPages = async () => {
    const res = await fetch(`${apiUrl}/pages`);
    if (!res.ok) throw new Error("Failed to fetch all pages");

    const results = await res.json();
    if (!results.length) throw new Error("No pages found");

    return results
        .filter((page: any) => page.slug !== "pagina-de-inicio") // ❌ Excluye la página "pagina-de-inicio"
        .map((page: any) => ({
            slug: page.slug,
            title: page.title.rendered,
        }));
};

