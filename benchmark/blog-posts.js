import { setTimeout } from 'node:timers/promises';
import { env } from 'node:process';

const author = 'Laurent RENARD';

const postList = [
  {
    author,
    title: "Let's build a UI framework - part 1/2",
    publicationDate: '2024-26-03',
    description:
      'We have now at our disposal a way to turn coroutines into web components. We also have a set of higher order functions to manage how a component updates. It is great time to put these small bricks together in an expressive yet simple new UI Framework.',
    permalink: 'https://lorenzofox.dev/posts/lets-build-a-framework-part-1/',
  },
  {
    author,
    title: 'Controllers on top of coroutine components',
    publicationDate: '2024-18-03',
    description:
      'We have previously described a way of modelling custom elements as coroutines (generator functions). We then made sure that they could be updated efficiently. In this post, we will look at different patterns for controlling how (and when) the components are updated: these are what I call controllers.',
    permalink: 'https://lorenzofox.dev/posts/controllers/',
  },
  {
    author,
    title: 'Batch component updates with micro tasks',
    publicationDate: '2024-03-11',
    description:
      'In the previous article, we finished by providing a function to convert a generator into a custom element. In this post we will iterate by adding reactive attributes to our component definition, and ensuring that updates are performed in batch, using the hidden gem queueMicrotask.',
    permalink: 'https://lorenzofox.dev/posts/reactive-attributes/',
  },
  {
    author,
    title: 'Coroutines and web components',
    publicationDate: '2024-03-04',
    description:
      'In the previous article we learned what coroutines are and saw some patterns they can help implement. In this article, we will see how coroutines can be used to model web components in a different way, and why you might like it.',
    permalink: 'https://lorenzofox.dev/posts/component-as-infinite-loop/',
  },
  {
    author,
    title: 'Coroutines in Javascript',
    publicationDate: '2024-02-24',
    description:
      'A coroutine is a function whose execution can be suspended and resumed, possibly passing some data. They happen to be useful for implementing various patterns involving cooperation between different tasks/functions such as asynchronous flows for example.',
    permalink: 'https://lorenzofox.dev/posts/coroutine/',
  },
];

const LATENCY = env.DB_LATENCY || 10;

export async function getPosts() {
  const latency = Math.round(Math.random() * LATENCY);
  await setTimeout(latency);
  return [...postList];
}
