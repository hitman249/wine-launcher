<template>
    <div class="item-point card-box m-b-10" @mouseenter="hover">
        <div class="item-point__background">
            <img :src="config.background" alt="">
        </div>

        <div class="table-box opport-box">
            <div v-if="config.icon" class="table-detail item-point__icon">
                <img :src="config.icon" alt="img" class="m-r-15" :style="{height: `${config.iconHeight}px`}"/>
            </div>

            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>{{config.name}}</b></h4>
                    <template v-if="!icon">
                        <p v-if="config.description" class="text-dark">
                            <span class="text-muted">{{config.description}}</span>
                        </p>
                        <p v-if="config.version" class="text-dark">
                            <span class="text-muted">{{config.version}}</span>
                        </p>
                    </template>
                    <template v-if="icon && config.icons.length">
                        <p class="text-dark">
                            <span v-for="icon in config.icons" :key="icon.path"  class="text-muted" :title="icon.path">
                                {{icon.truncate}}<br>
                            </span>
                        </p>
                    </template>
                </div>
            </div>

            <div v-if="!edit && !icon && time" class="table-detail time-detail">
                <p class="text-dark m-b-5">
                    <b>{{ $t('game.total-time') }}</b><br/>
                    <span class="label label-inverse">{{time}}</span>
                </p>
            </div>

            <div v-if="edit && !icon" class="table-detail item-point__info">
                <p class="text-dark m-b-5">
                    <span v-if="config.esync" class="label label-inverse m-r-5">esync</span>
                    <span v-if="config.fsync" class="label label-inverse m-r-5">fsync</span>
                    <span v-if="config.pulse" class="label label-inverse m-r-5">pulse</span>
                    <span v-if="!config.pulse" class="label label-inverse m-r-5">alsa</span>
                    <span v-if="config.csmt" class="label label-inverse m-r-5">csmt</span>
                    <span v-if="config.window" class="label label-inverse m-r-5">window</span>
                </p>
            </div>

            <div class="table-detail item-point__button-block">
                <PopupPlay v-if="!edit && !icon" :config="config"/>
                <PopupEditConfig v-else-if="edit && !icon" :config="config.config"/>

                <PopupIconCreate v-if="!edit && icon && config.icons.length === 0" :config="config"/>
                <PopupIconRemove v-if="!edit && icon && config.icons.length" :config="config"/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupPlay       from "./PopupPlay";
    import PopupIconCreate from "./PopupIconCreate";
    import PopupIconRemove from "./PopupIconRemove";
    import PopupEditConfig from "../Prefix/PopupEditConfig";
    import Time            from "../../helpers/time";

    export default {
        name:       "ItemGame",
        props:      {
            config: Object,
            edit:   Boolean,
            icon:   Boolean,
        },
        components: {
            PopupPlay,
            PopupIconCreate,
            PopupIconRemove,
            PopupEditConfig,
        },
        computed:   {
            time() {
                return Time.secondPrint(this.config.time);
            },
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

</style>