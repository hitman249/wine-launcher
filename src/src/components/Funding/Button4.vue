<template>
  <button :style="`--content: '${title}'`" :title="description" @click="$emit('click')"
          @mouseenter="$emit('mouseenter')">
    <div class="left"></div>
    {{ title }}
    <div class="right"></div>
  </button>
</template>

<script>
export default {
  name:       "Button4",
  props:      {
    title:       String,
    description: String,
  },
  components: {},
  methods:    {},
  computed:   {},
}
</script>

<style lang="less" scoped>
@text-color: hsla(210, 50%, 85%, 1);
@shadow-color: hsla(210, 40%, 52%, .4);
@btn-color: hsl(210, 80%, 42%, .1);
@bg-color: #141218;

* {
  box-sizing: border-box;
}

button {
  position: relative;
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;

  font-family: 'Varela Round', "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: 100;
  /*text-transform: uppercase;*/
  font-size: 21px;
  color: @text-color;
  background-color: @btn-color;
  box-shadow: @shadow-color 2px 2px 22px;
  border-radius: 3px;
  z-index: 0;
  overflow: hidden;
}

button:focus {
  outline-color: transparent;
  box-shadow: @btn-color 2px 2px 22px;
}

.right::after, button::after {
  content: var(--content);
  display: block;
  position: absolute;
  white-space: nowrap;
  padding: 40px 40px;
  pointer-events: none;
}

button::after {
  font-weight: 400;
  top: -30px;
  left: -20px;
}

.right, .left {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
}

.right {
  left: 66%;
}

.left {
  right: 66%;
}

.right::after {
  top: -30px;
  left: calc(-66% - 20px);

  background-color: @bg-color;
  color: transparent;
  transition: transform .4s ease-out;
  transform: translate(0, -90%) rotate(0deg)
}

button:hover .right::after {
  transform: translate(0, -47%) rotate(0deg)
}

button .right:hover::after {
  transform: translate(0, -50%) rotate(-7deg)
}

button .left:hover ~ .right::after {
  transform: translate(0, -50%) rotate(7deg)
}

/* bubbles */
button::before {
  content: '';
  pointer-events: none;
  opacity: .6;
  background: radial-gradient(circle at 20% 35%, transparent 0, transparent 2px, @text-color 3px, @text-color 4px, transparent 4px),
  radial-gradient(circle at 75% 44%, transparent 0, transparent 2px, @text-color 3px, @text-color 4px, transparent 4px),
  radial-gradient(circle at 46% 52%, transparent 0, transparent 4px, @text-color 5px, @text-color 6px, transparent 6px);

  width: 100%;
  height: 300%;
  top: 0;
  left: 0;
  position: absolute;
  animation: bubbles 5s linear infinite both;
}

@keyframes bubbles {
  from {
    transform: translate(0, 0);
  }
  to {
    transform: translate(0, -66.666%);
  }
}
</style>