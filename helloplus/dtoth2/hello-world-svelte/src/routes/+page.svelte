<script>
	/** @type {import('./$types').PageData} */
	export let data;
    /** @type {import('./$types').ActionData} */
	export let action_data;

</script>
<h1> Hello World </h1>
<form method="POST" action="?/generateJoke">
<button>
	Generate new random Chuck Norris joke and a dog
</button>
</form>

<h1>{action_data?.chuck == null ? (data.chuck.value) : action_data.chuck.value}</h1>
<img alt="Dog" src={action_data?.dog == null ? data.dog.message : action_data?.dog.message} />
