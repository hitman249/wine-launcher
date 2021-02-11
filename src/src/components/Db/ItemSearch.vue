<template>
  <div class="item-point card-box m-b-10" @mouseenter="hover">
    <div class="item-point__background">
      <img v-if="item.background_id" :src="item.background_url" alt="">
    </div>
    <div class="item-point__head">
      <span class="item">Версия: {{ item.version }}</span>
      <span class="item">Автор: {{ item.user.name }}</span>
      <span class="item">Лайков: {{ item.likes }}</span>
      <Like v-if="user.id !== item.user_id" class="btn__like"
            :status="item.like.length > 0" :type="type" :item="item" :model="'config'"/>
    </div>

    <div class="table-box opport-box">
      <div v-if="item.icon_id" class="table-detail item-point__icon">
        <img :src="item.icon_url" alt="img" class="m-r-15" :style="{height: `${item.iconHeight}px`}"/>
      </div>

      <div class="table-detail">
        <div class="member-info">
          <h4 class="item-point__title"><b>{{ item.name }}</b></h4>
          <p v-if="item.description" class="text-dark">
            <span class="text-muted">{{ item.description }}</span>
          </p>
        </div>
      </div>

      <div class="table-detail item-point__button-block">

        <div class="btn-group">
          <button type="button" class="btn item-point__button btn-custom waves-effect waves-light  dropdown-toggle"
                  data-toggle="dropdown" aria-expanded="false">
            {{ $t('labels.action') }} <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu">
            <PopupEditConfig :config="item.config" ref="popup" :hide-button="false"
                             :button-open-title="$t('labels.add')" :button-save-title="$t('labels.add')"/>
            <PopupRemove v-if="user.id === item.user_id || user.is_admin" :type="type" :item="item" :model="'config'"/>
          </ul>
        </div>

      </div>
    </div>

    <div class="item-point__footer">

    </div>
  </div>
</template>

<script>
import Like            from "../UI/Like";
import PopupEditConfig from "../../components/Prefix/PopupEditConfig";
import PopupRemove     from "../../components/Db/PopupRemove";

export default {
  name:       "ItemSearch",
  props:      {
    item: Object,
    type: String,
  },
  components: {
    Like,
    PopupEditConfig,
    PopupRemove,
  },
  data() {
    return {
      user: this.$store.state.user.info,
    };
  },
  computed:   {},
  mounted() {
  },
  methods:    {

    hover() {
      window.app.getAudioButton().hover();
    },

    click() {
      window.app.getAudioButton().click();
    },
  },
}
</script>

<style lang="less" scoped>
.item-point__head, .item-point__footer {
  position: absolute;
  top: 5px;
  right: 6px;
  font-size: 13px;
  text-transform: capitalize;

  .item {
    margin-left: 10px;
  }
}

.item-point__footer {
  top: unset;
  bottom: 5px;
}

.btn__like {
  margin-left: 10px;
}

.table-box .table-detail {
  vertical-align: middle;
}

.member-info {
  vertical-align: top;
  padding: 0;
  margin: 0;

  h4 {
    margin: 0;
  }

  pre {
    padding: 0 5px;
    margin-top: 5px;
    display: inline;
  }
}
</style>