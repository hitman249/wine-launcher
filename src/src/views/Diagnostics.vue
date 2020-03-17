<template>
    <div class="row">
        <div class="col-lg-12">
            <table class="table table-condensed m-0">
                <thead>
                <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Status</th>
                </tr>
                </thead>

                <tbody>

                <tr v-for="item in diagnostics.items" :key="item.name">
                    <td><span class="label label-inverse">{{item.type}}</span></td>
                    <td>
                        {{item.name}}
                        <template v-if="!item.status">
                            <br>
                            <table class="text-dark text-muted tr-title">
                                <tbody>

                                <template v-if="'lib' === item.type">
                                    <tr>
                                        <td>{{getArch(32)}}:</td>
                                        <td>{{getFile(item.win32)}}</td>
                                    </tr>
                                    <tr v-if="64 === item.arch">
                                        <td>{{getArch(64)}}:</td>
                                        <td>{{getFile(item.win64)}}</td>
                                    </tr>
                                </template>

                                    <tr>
                                        <td ></td>
                                        <td><code>sudo apt-get install {{getPackages(item.packages)}}</code></td>
                                    </tr>

                                </tbody>
                            </table>
                        </template>
                    </td>
                    <td>
                        <span class="badge badge-success"
                              :class="{'badge-success' : item.status, 'badge-danger': !item.status}">.
                        </span>
                    </td>
                </tr>

                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import action   from "../store/action";
    import Collects from "../helpers/collects";

    export default {
        name:       'Diagnostics',
        components: {},
        data() {
            return {
                diagnostics: this.$store.state.diagnostics,
            };
        },
        mounted() {
            this.$store.dispatch(action.get('diagnostics').LOAD);
        },
        methods:    {
            getArch(arch) {
                return Collects.arch['win' + arch];
            },
            getFile(file) {
                return file ? file.path : 'missing';
            },
            getPackages(packages) {
                return packages.join(' ') + ' ' + packages.join(':i386 ') + ':i386';
            }
        },
    }
</script>

<style lang="less" scoped>
    .badge {
        position: relative;
        color: transparent;
        top: -2px;
        width: 13px;
        height: 13px;
    }

    .tr-title td {
        padding-right: 10px;
    }
</style>