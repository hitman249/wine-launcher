import action from "../../store/action";

export default {
  data() {
    return {
      popup_opened: false,
    };
  },
  mounted() {
    document.addEventListener('custombox:content:open', this.onContentOpened);
    document.addEventListener('custombox:content:close', this.onContentClosed);
  },
  beforeDestroy() {
    document.removeEventListener('custombox:content:open', this.onContentOpened);
    document.removeEventListener('custombox:content:close', this.onContentClosed);
  },
  methods: {
    onContentOpened() {
      window.app.getAudioButton().click();
      this.popup_opened = true;
    },
    onContentClosed() {
      let logs = this.$store.state.logs;

      if (logs.enable) {
        this.$store.dispatch(action.get('logs').START, true);
      }

      this.popup_opened = false;
    },
  },
}