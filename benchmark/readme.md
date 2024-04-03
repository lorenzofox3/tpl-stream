# benchmark 

This is not really a _benchmark_, but rather a toy application to assess the performances of the library in a _real world_ use case, versus 
different baselines: the same [fastify](https://fastify.dev/) application built with the popular template engines [pug](https://pugjs.org/) (the one I would use by default) and [ejs](https://ejs.co/)(a very popular one in the community with 13M weekly downloads).

## The application 

![Screenshot 2024-04-03 at 11 05 47](https://github.com/lorenzofox3/tpl-stream/assets/2402022/cc021ce7-5405-4690-8d9b-43904fb05c45)

The application is a blog page where posts are loaded from a fake database. To simulate some latency we run the following code:
```js
const LATENCY = env.DB_LATENCY || 10;

export async function getPosts() {
  const latency = Math.round(Math.random() * LATENCY);
  await setTimeout(latency);
  return [...postList];
}
```
## Load simulation

Then, we run [autocannon](https://github.com/mcollina/autocannon) to see how many requests the server can process.  
On my machine, I get the following results (median requests by second):

| tpl-stream | pug | ejs |
|------------|-----|-----|
|   1550     | 1632| 670 |

## conclusion

``tpl-stream`` is more than capable and I will use it as my default template engine from now.
