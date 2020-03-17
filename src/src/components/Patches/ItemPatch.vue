<template>
    <div class="item-point card-box m-b-10">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15">
                        <span class="badge badge-success" :class="{'badge-success' : active, 'badge-danger': !active}">
                            .
                        </span>
                        &nbsp;
                        <b>{{patch.name}}</b>
                    </h4>
                    <p v-if="patch.version" class="text-dark">
                        <span class="text-muted">{{patch.version}}</span>
                    </p>
                    <p class="text-dark">
                        <span class="text-muted">{{getArch()}}</span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">
                <p v-if="patch.size" class="text-dark m-b-10">
                    <span class="label label-inverse">Размер: {{patch.size_formatted}}</span>
                </p>
            </div>

            <div class="table-detail item-point__button-block">
                <PopupPatch v-if="patch" :patch="patch.patch" ref="popup"/>
                <template v-if="!patch.created">
                    <br>
                    <PopupCommand v-if="patch" :patch="patch.patch" ref="popup"/>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupPatch   from "./PopupPatch";
    import PopupCommand from "./PopupCommand";
    import Collects     from "../../helpers/collects";

    export default {
        name:       "ItemPatch",
        components: {
            PopupPatch,
            PopupCommand,
        },
        props:      {
            patch: Object,
        },
        methods:    {
            getArch() {
                return Collects.arch[this.patch.arch];
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
    }
</style>