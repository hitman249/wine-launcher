<template>
    <div class="lang">
        <div class="lang__selected">
            {{current}}
        </div>
        <div class="lang__items">
            <div v-for="lang in items" class="lang__item" :key="lang.key" @click="select(lang.key)">{{lang.name}}</div>
        </div>
    </div>
</template>

<script>
    import _ from "lodash";

    export default {
        name:    'Language',
        data() {
            let languages = {
                ru: 'RU',
                en: 'EN',
            };

            let prefix      = window.app.getPrefix();
            let current     = prefix.getLanguage();
            let currentName = languages[current];

            delete languages[current];

            return {
                prefix,
                current: currentName,
                items:   Object.keys(languages).map((lang) => ({ name: languages[lang], key: lang })),
            };
        },
        mounted() {
        },
        methods: {
            select(lang) {
                this.prefix.setLanguage(lang);
                this.prefix.save();
                window.app.reload();
            },
        },
        watch:   {},
        beforeDestroy() {
        },
    }
</script>

<style lang="less" scoped>
    .lang__items {
        display: block;
        position: absolute;
        top: 100%;
        left: 6px;
        border: 2px solid rgba(255, 255, 255, 0.15);
        padding: 5px 10px;
        list-style: none;
        visibility: hidden;
        opacity: 0;
        margin-top: 10px;
        transition: all 0.2s ease;
        background-color: #2b333b;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
        text-align: center;
    }

    .lang__item {
        padding: 5px 10px;

        &:hover {
            color: #98a6ad;
        }
    }

    .lang {
        text-align: center;
        position: absolute;
        user-select: none;
        top: 35px;
        right: 20px;
        cursor: pointer;
        width: 70px;
        height: 30px;

        &:hover {
            color: #2dc4b9;

            .lang__items {
                visibility: visible;
                opacity: 1;
                margin-top: 0;
                color: rgba(152, 166, 173, 0.7);
            }
        }
    }
</style>