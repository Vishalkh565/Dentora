const domain = process.env.VITE_SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.VITE_SHOPIFY_PUBLIC_ACCESS_TOKEN;

async function listProducts() {
  const query = `
    {
      products(first: 20) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${domain}/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': accessToken,
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
    } else {
      console.log('--- Current Shopify Products ---');
      result.data.products.edges.forEach(({ node }) => {
        console.log(`Title: ${node.title} | Handle: ${node.handle}`);
      });
    }
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

listProducts();
