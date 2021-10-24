export default Vue.component('vueTable',{
    props: ['color'],
    template: `<b-table :items="items" head-variant={{color}} striped></b-table>`
});