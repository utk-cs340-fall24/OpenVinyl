
/** @type {import('./$types').PageLoad} */ export async function load({ fetch, params }) {
  const res = await fetch("https://api.chucknorris.io/jokes/random");
  const chuck = await res.json();
  const res2 = await fetch("https://dog.ceo/api/breeds/image/random");
  const dog = await res2.json();
  return {
    chuck,dog 
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
	generateJoke: async (event) => {
		const res = await fetch("https://api.chucknorris.io/jokes/random");
  const chuck = await res.json();
  return {
    chuck
  };
	},
  generateDog: async (event) => {
    const res2 = await fetch("https://dog.ceo/api/breeds/image/random");
    const dog = await res2.json();
    return {
      dog
    }
  }
};