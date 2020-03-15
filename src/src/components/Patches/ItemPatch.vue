<template>
    <div class="item-point card-box m-b-10">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>{{patch.name}}</b></h4>
                    <p v-if="patch.version" class="text-dark">
                        <span class="text-muted">{{patch.version}}</span>
                    </p>
                    <p class="text-dark">
                        <span class="text-muted">{{getArch()}}</span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">

            </div>

            <div class="table-detail item-point__button-block">
                <PopupPatch v-if="patch" :patch="patch.patch" ref="popup"/>
                <br>
                <PopupCommand v-if="patch" :patch="patch.patch" ref="popup"/>
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
        }
    }
</script>

<style lang="less" scoped>
    .item-point__info {
        text-align: left;
    }
</style>