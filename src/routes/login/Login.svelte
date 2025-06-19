<script>
  import { Button } from "m3-svelte";
  import TangentContainer from "$lib/TangentContainer.svelte";
  import EmailInput from "./EmailInput.svelte";
</script>

<!-- TODO: switch to further parts if email is known -->
<div class="login">
  <TangentContainer contract>
    <EmailInput />
    <Button variant="outlined" href="/login/byoi">Advanced: bring your own identity</Button>
  </TangentContainer>
</div>

<style>
  .login {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    height: 90dvh;
    flex: none;
  }
  .login :global {
    .container > form {
      display: flex;
      flex-direction: column;
      margin-block: auto;
    }
    .container > a {
      align-self: center;
    }
  }
</style>
