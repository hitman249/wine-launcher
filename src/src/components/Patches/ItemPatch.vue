<template>
  <div class="item-point card-box m-b-10" @mouseenter="hover">
    <div class="item-point__background"></div>

    <div class="table-box opport-box">
      <div class="table-detail">
        <div class="member-info">
          <h4 class="m-0 m-b-10">
            <span v-if="!patch.created && patch" class="label label-success label-new">NEW</span>
            <span class="badge badge-success" :class="{'badge-success' : active, 'badge-danger': !active}">
              .
            </span>
            &nbsp;
            <b>{{ patch.sort }} - {{ patch.name }}</b>
            &nbsp;
          </h4>
          <table class="text-dark text-muted tr-title">
            <tbody>
            <tr>
              <td>{{ $t('labels.version') }}</td>
              <td><span>{{ patch.version }}</span></td>
            </tr>
            <tr>
              <td>{{ $t('labels.arch') }}</td>
              <td>
                <span>{{ getArch() }}</span>
                <span v-if="patch.arch !== wine.status.arch" class="m-l-10 label label-danger">
                  {{ $t('labels.incompatible') }}
                </span>
              </td>
            </tr>
            <tr>
              <td>{{ $t('labels.folder') }}</td>
              <td><span>{{ patch.code }}</span></td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-detail item-point__info">
        <p v-if="patch.size" class="text-dark m-b-10 text-right">
          <span class="label label-inverse">{{ $t('labels.size') }}: {{ patch.size_formatted }}</span>
        </p>
      </div>

      <div class="table-detail item-point__button-block">
        <div class="btn-group">
          <button type="button" class="btn item-point__button btn-custom waves-effect waves-light  dropdown-toggle"
                  data-toggle="dropdown" aria-expanded="false">
            {{ $t('labels.action') }} <span class="caret"></span>
          </button>
          <ul class="dropdown-menu" role="menu">
            <PopupCommand v-if="!patch.created && patch" :patch="patch.patch" ref="popup"/>
            <PopupPatch v-if="patch" :patch="patch.patch" ref="popup"/>
            <PopupShare v-if="!shared && patch && !patch.is_shared" :item="patch"/>
            <PopupApply v-if="shared && patch && !patch.is_install" :item="patch"/>
            <PopupRemove v-if="patch" :item="patch"/>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PopupPatch   from "./PopupPatch";
import PopupCommand from "./PopupCommand";
import PopupRemove  from "./PopupRemove";
import Collects     from "../../helpers/collects";
import PopupShare   from "./PopupShare";
import PopupApply   from "./PopupApply";

export default {
  name:       "ItemPatch",
  components: {
    PopupApply,
    PopupShare,
    PopupPatch,
    PopupCommand,
    PopupRemove,
  },
  props:      {
    patch: Object,
    shared: Boolean,
  },
  data() {
    return {
      wine: this.$store.state.wine,
    };
  },
  methods:    {
    getArch() {
      return Collects.arch[this.patch.arch];
    },
    hover() {
      window.app.getAudioButton().hover();
    },
  },
  computed:   {
    active() {
      return this.patch.active && this.patch.created;
    },
  }
}
</script>

<style lang="less" scoped>
.item-point__info {
  text-align: left;
}

.badge {
  position: relative;
  color: transparent;
  top: -2px;
  width: 13px;
  height: 13px;
  margin-right: 5px;
}

.tr-title td {
  padding-right: 10px;
}

.item-point__button-block > div {
  margin-top: 10px;
  margin-bottom: 10px;
}

.label-new {
  font-size: 10px;
  margin-right: 5px;
  vertical-align: middle;
  position: relative;
  top: -1px;
}
</style>