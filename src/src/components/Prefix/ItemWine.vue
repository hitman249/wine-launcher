<template>
    <div class="item-point card-box m-b-10">
        <div class="item-point__background"></div>

        <div class="table-box opport-box">
            <div class="table-detail">
                <div class="member-info">
                    <h4 class="m-t-15"><b>Wine</b></h4>
                    <p class="text-dark">
                        <span class="text-muted">{{status.wine_version}}</span>
                    </p>
                    <p class="text-dark">
                        <span class="text-muted"></span>
                    </p>
                </div>
            </div>

            <div class="table-detail item-point__info">
                <p v-if="status.libs" class="text-dark m-b-10">
                    <span class="label label-inverse">Отсутствуют библиотеки:</span><br>
                    <code v-for="lib in status.libs" :key="lib" class="tag">{{lib}}</code>
                </p>
                <p v-if="status.wine_version !== status.prefix_version" class="text-dark m-b-5">
                    <span class="label label-inverse">Префикс не совместим с текущим Wine</span>
                </p>
            </div>

            <div class="table-detail item-point__button-block">
                <PopupWine/>
            </div>
        </div>
    </div>
</template>

<script>
    import PopupWine from "./PopupWine";
    import Collects  from "../../helpers/collects";

    export default {
        name:       "ItemWine",
        props:      {
            status: Object,
        },
        components: {
            PopupWine,
        },
        methods:    {
            getArch() {
                return Collects.arch[this.status.arch];
            },
        }
    }
</script>

<style lang="less" scoped>
    .item-point__info {
        text-align: left;
    }
</style>