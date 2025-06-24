<script>
  import HotCorner from "./HotCorner.svelte";

  let overviewing = $state(false);
</script>

<HotCorner {overviewing} trigger={() => (overviewing = !overviewing)} />
