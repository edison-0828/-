package vip.xiaonuo.zj.modular.favorite.service;

import com.baomidou.mybatisplus.extension.service.IService;
import vip.xiaonuo.zj.modular.favorite.entity.ZjFavorite;
import vip.xiaonuo.zj.modular.listing.entity.ZjListing;

import java.util.List;

public interface ZjFavoriteService extends IService<ZjFavorite> {
    boolean toggle(String listingId);
    List<ZjListing> myFavorites();
}
