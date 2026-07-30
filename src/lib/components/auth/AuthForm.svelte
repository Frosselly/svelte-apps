<script>
	import { loginUser } from './auth.remote';
</script>

<form {...loginUser}>
	<input name="username" placeholder="Username" />
	<button type="submit">Login</button>
</form>
