<script>
  import TangentContainer from "$lib/TangentContainer.svelte";
  import EmailInput from "./EmailInput.svelte";
</script>

<!-- TODO: switch to further parts if email is known -->
<!-- TODO: "continue with Tangent" by default but allow setting up different storage -->
<div class="login">
  <TangentContainer contract>
    <EmailInput />
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
